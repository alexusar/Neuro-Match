function SignUpUI() {
    
    return (
        <div className="h-screen bg-white flex flex-col">
            <div className="fmin-h-screen flex flex-col">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#0f172a]">Register</h1>
                </div>
                
                <div className="flex flex-1 flex-col items-center justify-center space-y-2">         
                    <form action="http://localhost:6969/api/register" method="POST" className="space-y-4">
                        <input type="text" name="username" placeholder="Username" required className="mb-2 p-2 border rounded" />
                        <input type="text" name="firstname" placeholder="First Name" required className="mb-2 p-2 border rounded" />
                        <input type="text" name="lastname" placeholder="Last Name" required className="mb-2 p-2 border rounded" />
                        <input type="email" name="email" placeholder="Email" required className="mb-2 p-2 border rounded" />
                        <input type="password" name="password" placeholder="Password" required className="mb-2 p-2 border rounded" />                    
                      
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Register</button>
                    </form>
                </div>
            </div>
            <div className="text-center mt-4">
                <p>Already have an account? <a href="/" className="text-blue-500">Login</a></p>
            </div>
        </div>
    );
}

export default SignUpUI;