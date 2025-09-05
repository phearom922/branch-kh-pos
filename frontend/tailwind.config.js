/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#ff7100',
                'primary-dark': '#e65c00',
            },
        },
    },
    plugins: [],
};