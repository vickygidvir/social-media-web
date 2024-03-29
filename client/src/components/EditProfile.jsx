import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { login, updateProfile } from "../redux/userSlice";
import { apiRequest } from "../utils";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../firebase";


const EditProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: user?.user?.firstName || "",
      lastName: user?.user?.lastName || "",
      profession: user?.user?.profession || "",
      location: user?.user?.location || "",
      profileUrl: user?.user?.profileUrl || "",
    },
  });

  const handleUpload = () => {
    return new Promise((resolve, reject) => {
      if (file) {
        const storage = getStorage(app);
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.error(error);
            reject("Upload failed");
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setUrl(downloadURL);
              resolve(downloadURL);
            });
          }
        );
      } else {
        resolve("");
      }
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");
    try {
      const uploadedImageUrl = await handleUpload();
      const newdata = {
        firstName: data.firstName,
        lastName: data.lastName,
        profession: data.profession,
        location: data.location,
        profileUrl: uploadedImageUrl || data.profileUrl,
      };

      // Update user data
      const res = await apiRequest({
        url: `/users/updateUser/${user?.user?._id}`,
        data: { newdata, userId: user?.user?._id },
        method: "PUT",
      });

      if (res?.data === "failed") {
        setErrMsg("Update failed");
      } else {
        setErrMsg("");
        dispatch(updateProfile(false));
        dispatch(login({ ...user, user: { ...user.user, ...newdata } }));
        const updatedUser = { ...user, user: { ...user.user, ...newdata } };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      setErrMsg("Update failed");
    }
  };

  const handleClose = () => {
    dispatch(updateProfile(false));
  };

  const handleSelect = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-[#000] opacity-70"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        &#8203;
        <div
          className="inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="flex justify-between px-6 pt-5 pb-2">
            <label
              htmlFor="name"
              className="block font-medium text-xl text-ascent-1 text-left"
            >
              Edit Profile
            </label>

            <button className="text-ascent-1" onClick={handleClose}>
              <MdClose size={22} />
            </button>
          </div>
          <form
            className="px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextInput
              name="firstName"
              label="First Name"
              placeholder="First Name"
              type="text"
              styles="w-full"
              value={user?.user?.firstName}
              register={register("firstName")}
              error={errors.firstName ? errors.firstName.message : ""}
            />

            <TextInput
              label="Last Name"
              placeholder="Last Name"
              type="text"
              styles="w-full"
              value={user?.user?.lastName}
              register={register("lastName")}
              error={errors.lastName ? errors.lastName.message : ""}
            />

            <TextInput
              name="profession"
              label="Profession"
              placeholder="Profession"
              type="text"
              styles="w-full"
              value={user?.user?.profession}
              register={register("profession")}
              error={errors.profession ? errors.profession.message : ""}
            />

            <TextInput
              label="Location"
              placeholder="Location"
              type="text"
              styles="w-full"
              value={user?.user?.location}
              register={register("location")}
              error={errors.location ? errors.location.message : ""}
            />

            <label
              className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
              htmlFor="imgUpload"
            >
              <input
                type="file"
                id="imgUpload"
                onChange={(e) => handleSelect(e)}
                accept=".jpg, .png, .jpeg"
              />
            </label>

            {errMsg && <span className="text-[#f64949fe]">{errMsg}</span>}

            <div className="py-5 sm:flex sm:flex-row-reverse border-t border-[#66666645]">
              {isSubmitting ? (
                <Loading />
              ) : (
                <CustomButton
                  type="submit"
                  containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`}
                  title="Submit"
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;