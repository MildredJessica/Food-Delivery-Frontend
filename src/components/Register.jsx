import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            country: 'US'
        }
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // Multi-step form
    const [showAddress, setShowAddress] = useState(false); // Toggle for address section
    const { register } = useAuth();
    const navigate = useNavigate();

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
                alert('Registration successful! Redirecting to login...');
                
                // Redirect to login page after 1.5 seconds
                setTimeout(() => {
                    navigate('/login');
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
                    sign in to your existing account
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
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must be at least 6 characters
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password *
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
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
                                        >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="AU">Australia</option>
                                        <option value="IN">India</option>
                                        <option value="DE">Germany</option>
                                        <option value="FR">France</option>
                                        <option value="JP">Japan</option>
                                        <option value="CN">China</option>
                                        <option value="BR">Brazil</option>
                                        <option value="ZA">South Africa</option>
                                        <option value="NG">Nigeria</option>
                                        <option value="MX">Mexico</option>
                                        <option value="RU">Russia</option>
                                        <option value="IT">Italy</option>
                                        <option value="ES">Spain</option>
                                        <option value="KR">South Korea</option>
                                        <option value="TR">Turkey</option>
                                        <option value="SA">Saudi Arabia</option>
                                        <option value="AR">Argentina</option>
                                        <option value="Other">Other</option>
                                        </select>
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

