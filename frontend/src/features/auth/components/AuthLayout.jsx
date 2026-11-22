function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white">

            {/* Left Branding / Hero Background Section */}
            <div
                role="img"
                aria-label="Football Store hero background"
                className="relative min-h-65 sm:min-h-85 md:min-h-screen w-full bg-cover bg-center bg-no-repeat bg-black flex items-center justify-center"
                style={{ backgroundImage: "url('/login.png')" }}
            />

            {/* Right Form Section */}
            <div className="flex justify-center items-center p-6 sm:p-10 md:p-12 w-full bg-white">
                {children}
            </div>

        </div>
    );
}

export default AuthLayout;
