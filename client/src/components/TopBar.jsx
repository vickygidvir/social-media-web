import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SlSocialStumbleupon } from 'react-icons/sl';
import { Link } from 'react-router-dom';
import CustomButton from './CustomButton';
import { useForm } from 'react-hook-form';
import TextInput from './TextInput';
import { BsMoon, BsSunFill } from 'react-icons/bs';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { setTheme } from '../redux/themeSlice';
import { userLogout } from '../redux/userSlice';

const TopBar = () => {
	const { theme } = useSelector(state => state.theme)
	const { user } = useSelector(state => state.user)
	const dispatch = useDispatch();
	const { register, handleSubmit, formState: { errors } } = useForm();
	const handleSearch = async (data) => { };

	const handleTheme = () => {
		const themeValue = theme === "light" ? "dark " : "light"
		dispatch(setTheme(themeValue))
	}

	return (
		<div className='topbar w-full flex items-center justify-between py-3 md:py-6 px-4 bg-primary '>
			<Link to="/" className="flex gap-2 items-center">
				<div className='p-1 bg-[#065ad8] rounded text-white'>
					<SlSocialStumbleupon />
				</div>
				<span className="text-xl md:text-2xl text-[#065ad8] font-semibold" >Sharefun</span>
			</Link>

			<form className='hidden md:flex items-center justify-center ' onSubmit={handleSubmit(handleSearch)}>


				<TextInput placeholder="Search..."
					styles='w-[18rem] lg:w-[38rem] rounded-l-full py-3' register={register("search")} />

				<CustomButton title='Search' type='submit' containerStyles='bg-[#0444a4] text-white px-6 py-2.5  rounded-r-full' />

			</form>

			<div className='flex gap-4 items-center text-ascent-1 text-md md:text-xl'>
				<button onClick={() => handleTheme()}>{theme ? <BsMoon /> : <BsSunFill />}</button>
				<div className='hidden lg:flex'>
					<IoIosNotificationsOutline />
				</div>

				<div>
					<CustomButton title='Logout' onClick={()=>dispatch(userLogout())} containerStyles='text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full' />
				</div>



			</div>
		</div>
	)
}

export default TopBar