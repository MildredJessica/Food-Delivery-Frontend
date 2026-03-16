import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user', // default role
        address: {
            street: '',
            city: '',
            state: '',
            country: 'NG'
        },
        avatar: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // Multi-step form
    const [showAddress, setShowAddress] = useState(false); // Toggle for address section
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);

    
    useEffect(() =>{
        fetchCountries();
    }, [])

    const fetchCountries = async() =>{
        try {
            // Fetch all countries
            const response = await axios.get('https://restcountries.com/v3.1/independent?status=true');
            const sortedCountries = response.data
                .map(country => ({
                    code: country.cca2,
                    name: country.name.common
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setCountries(sortedCountries);
        } catch(error){
            console.error('Error fetching countries:', error);
            // Fallback to a basic list if API fails
            setCountries([
                {code: 'US', name: 'United States'},
                {code: 'GB', name: 'United Kingdom'},
                {code: 'NG', name: 'Nigeria'},
            ])
        } finally {
            setLoadingCountries(false);
        }
    };

    
    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
                setFormData({
                ...formData,
                [parent]: {
                ...formData[parent],
                [child]: value
                }
            });
    
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        if(name === 'avatar' && value)
        setAvatarPreview(value);
    };


    const validateStep1 = () => {
        if (!formData.name.trim()) {
        setError('Name is required');
        return false;
        }
        
        if (!formData.email.trim()) {
        setError('Email is required');
        return false;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
        }
        
        if (!formData.password) {
        setError('Password is required');
        return false;
        }
        
        if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
        }
        
        return true;
    };

    const validateAvatarUrl = (url) => {
        if(!url) return true;
        try{
            new URL(url);
            return true;
        } catch{
            return false;
        }
    };

    const nextStep = () => {
        if (validateStep1()) {
        setStep(2);
        setError('');
        }
    };

    const prevStep = () => {
        setStep(1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.avatar && !validateAvatarUrl(formData.avatar)){
            setError('Please enter a valid url for avatar');
            return;
        }

        // Final validation
        if (!validateStep1()) {
        return;
        }

        setLoading(true);
        try {
            // Prepare data for registration
            const { confirmPassword, ...registerData } = formData;
            
            // If user doesn't want to add address now, remove empty address object
            if (!showAddress || !registerData.address.street.trim()) {
                delete registerData.address;
            }
        
            
            const result = await register(registerData);
            console.log('Registration result:', result);
            
            if (result.success) {
                // Show success message
                // toast.success('Registration successful! Redirecting to login...');
                toast.success('Registration successful! Welcome to FoodExpress, '+
                    'where you can buy mouth watering dishes at an affordable price');
                // Redirect to homepage page after 1.5 seconds
                setTimeout(() => {
                    // navigate('/login');
                    navigate('/');
                }, 1500);  
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error in handleSubmit:', err);
            setError('Registration failed. Please try again.');
            setLoading(false);
            return;
        }finally {
            setLoading(false);
        }
    };

    // Progress steps
    const steps = [
        { number: 1, title: 'Account Info' },
        { number: 2, title: 'Additional Info' }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link
                    to="/login"
                    className="font-medium text-orange-600 hover:text-orange-500"
                    >
                    Sign in to your existing account
                    </Link>
                </p>
                </div>
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((stepItem, index) => (
                        <React.Fragment key={stepItem.number}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step >= stepItem.number 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {stepItem.number}
                                </div>
                                <span className="mt-2 text-sm text-gray-600">{stepItem.title}</span>
                            </div>
                            {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-4 ${
                                step > stepItem.number ? 'bg-orange-500' : 'bg-gray-200'
                                }`}>
                            </div>
                            )}
                        </React.Fragment>
                        ))}
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                            
                            <div>
                                <label htmlFor='avatar' className="block text-sm font-medium text-gray-700">
                                    Profile Picture URL(Optional)
                                </label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <div className="flex-1">
                                        <input 
                                            id="avatar"
                                            name='avatar'
                                            type="url"
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                            placeholder="https://example.com/avatar.jpg"
                                            value={formData.avatar}
                                            onChange={handleChange}
                                        />
                                        <p className='text-xs text-gray-500 mt-1'>
                                            Enter a URL to your proffile picture(optional)
                                        </p>
                                    </div>
                                    {/* Avatar Preview */}
                                    {avatarPreview && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={avatarPreview}
                                                alt='Avatar Perview'
                                                className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                                                onError={(e) =>{
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/64?text=Error'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name *
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address *
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password *
                                    </label>
                                    <div className='relative mt-1'>
                                        <input
                                            id="password"
                                            name="password"
                                            type={isFirefox ? (showPassword ? "text" : "password") : "text"}
                                            style={!isFirefox ? {WebkitTextSecurity : showPassword ? 'none' : 'disc'} : {}}
                                            required
                                            className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must be at least 6 characters
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password *
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text": "password"}
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                type="button"
                                onClick={nextStep}
                                className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-semibold"
                                >
                                Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Additional Information */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
                
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                Account Type
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="relative">
                                        <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={formData.role === 'user'}
                                        onChange={handleChange}
                                        className="sr-only"
                                        />
                                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            formData.role === 'user' 
                                                ? 'border-orange-500 bg-orange-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <div className="flex items-start">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-3 ${
                                                    formData.role === 'user' 
                                                        ? 'border-orange-500' 
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {formData.role === 'user' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Customer</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Order food delivery from restaurants
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                    
                                    <label className="relative">
                                        <input
                                        type="radio"
                                        name="role"
                                        value="restaurant_owner"
                                        checked={formData.role === 'restaurant_owner'}
                                        onChange={handleChange}
                                        className="sr-only"
                                        />
                                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            formData.role === 'restaurant_owner' 
                                                ? 'border-orange-500 bg-orange-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <div className="flex items-start">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-3 ${
                                                    formData.role === 'restaurant_owner' 
                                                        ? 'border-orange-500' 
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {formData.role === 'restaurant_owner' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Restaurant Owner</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        List your restaurant and manage orders
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                </label>
                                </div>
                            </div>

                            {/* Address Toggle */}
                            <div className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Add Delivery Address</h4>
                                        <p className="text-sm text-gray-500">
                                        Add now or skip and add later
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddress(!showAddress)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        showAddress ? 'bg-orange-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        showAddress ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>
                                
                            </div>

                            {/* Address Form */}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
                            {showAddress && (
                                <div className="space-y-4 bg-gray-50 p-6 rounded-lg border">
                                    <h4 className="font-medium text-gray-900">Delivery Address</h4>
                                    
                                    <div>
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                                        Street Address
                                        </label>
                                        <input
                                        id="street"
                                        name="address.street"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="123 Main Street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                                City
                                            </label>
                                            <input
                                                id="city"
                                                name="address.city"
                                                type="text"
                                                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                placeholder="New York"
                                                value={formData.address.city}
                                                onChange={handleChange}
                                                />
                                        </div>

                                        <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                            State
                                        </label>
                                        <input
                                            id="state"
                                            name="address.state"
                                            type="text"
                                            className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                            placeholder="NY"
                                            value={formData.address.state}
                                            onChange={handleChange}
                                        />
                                        </div>

                                    
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                        Country
                                        </label>
                                        <select
                                            id="country"
                                            name="address.country"
                                            value={formData.address.country}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                            disabled={loadingCountries}
                                        >
                                            <option value="">Select a country</option>
                                            {countries.map(({code, name}) =>(
                                                <option key={code} value={code}>{name}</option>
                                            ))}
                                        </select>
                                        {loadingCountries && (
                                            <p className="text-sm text-gray-500 mt-1">Loading countries...</p>
                                        )}
                                    </div>
                                </div>
                            )}

                                <div className="flex space-x-4 pt-6">
                                    <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-semibold"
                                    >
                                        Back
                                    </button>
                                    <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>
                        </div>
                    )}
                </form>

                {/* Terms and Privacy */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-orange-500 hover:text-orange-600">
                        Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-orange-500 hover:text-orange-600">
                        Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

