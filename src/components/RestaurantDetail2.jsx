import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            // Fetch all countries
            const response = await axios.get('https://restcountries.com/v3.1/all');
            
            // Sort alphabetically by common name
            const sortedCountries = response.data
                .map(country => ({
                    code: country.cca2,
                    name: country.name.common
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            setCountries(sortedCountries);
        } catch (error) {
            console.error('Error fetching countries:', error);
            // Fallback to a basic list if API fails
            setCountries([
                { code: 'US', name: 'United States' },
                { code: 'GB', name: 'United Kingdom' },
                { code: 'NG', name: 'Nigeria' },
                // Add more fallback countries
            ]);
        } finally {
            setLoadingCountries(false);
        }
    };

    return (
        <div>
            {/* Your form JSX */}
            <select
                id="country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg"
                disabled={loadingCountries}
            >
                <option value="">Select a country</option>
                {countries.map(({code, name}) => (
                    <option key={code} value={code}>{name}</option>
                ))}
            </select>
            {loadingCountries && (
                <p className="text-sm text-gray-500 mt-1">Loading countries...</p>
            )}
        </div>
    );
};