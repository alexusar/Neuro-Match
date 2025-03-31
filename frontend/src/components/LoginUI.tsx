function LoginUI() {
  
    return (
        <div className="login-container">   
            <div className="login-form">
                <h1 className="text-4xl font-bold mb-4">Login</h1>
                <form action="/api/login" method="POST">
                    <input type="text" name="username" placeholder="Username" required className="mb-2 p-2 border rounded" />
                    <input type="password" name="password" placeholder="Password" required className="mb-2 p-2 border rounded" />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
                </form>
            </div>
            <div className="register-link mt-4">    
                <p>Don't have an account? <a href="/register" className="text-blue-500">Register</a></p>
            </div>
        </div>
    );
}

export default LoginUI;