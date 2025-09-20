import React from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm();
    const {signup , loading} = useAuthStore() ; 
     //for navigation 
     const navigate = useNavigate() ; 
    const onSubmit = (data) => {
      try{
       const formattedData = {
       fullName: data.Name,
       email: data.Email,
       password: data.Password,
    };
       signup(formattedData) ; 
       navigate("/home")

  }catch(error) {
     console.log("SignUp eroor" , error) ; 
  }
       
    }
      
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-transparent pt-48'>
      <div className='bg-transparent shadow-xl rounded-xl p-10 w-full max-w-2xl'>
        <h2 className='text-2xl text-slate-900 font-semibold mb-6 text-center'>
          Note: All fields are mandatory
        </h2>

        <form className='flex flex-col gap-6' onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className='flex flex-col gap-2'>
            <label className='text-lg font-medium'>Name</label>
            <input
              {...register("Name", { required: true })}
              placeholder="Enter full name"
              className='border border-gray-300 rounded-lg px-4 py-2 text-lg w-full hover:border-green-700 hover:shadow-md hover:shadow-green-200 transition duration-200'
            />
            {errors.Name && <span className='text-red-500 text-sm'>This field is required</span>}
          </div>

          {/* email */}
          <div className='flex flex-col gap-2'>
            <label className='text-lg font-medium'>Email</label>
            <input
              type="email"
              {...register("Email", { required: true })}
              placeholder='Enter Email'
              className='border border-gray-300 rounded-lg px-4 py-2 text-lg w-full hover:border-green-700 hover:shadow-md hover:shadow-green-200 transition duration-200'
            />
            {errors.Email && <span className='text-red-500 text-sm'>This field is required</span>}
          </div>

          {/* password */} 
          <div className='flex flex-col gap-2'>
            <label className='text-lg font-medium'>Password</label>
            <input
              type="password"
              {...register("Password", {min : 6 ,  required: true })}
              placeholder='Enter Password'
              className='border border-gray-300 rounded-lg px-4 py-2 text-lg w-full hover:border-green-700 hover:shadow-md hover:shadow-green-200 transition duration-200'
            />
            {errors.Password && <span className='text-red-500 text-sm'>This field is required</span>}
          </div>

         

         
           {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`bg-green-700 hover:bg-green-800 text-white text-lg font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200 ${loading && 'opacity-50 cursor-not-allowed'}`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
      
    </div>
  );
}

export default SignUp;
