import express, {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';


// async allows other request to be handled, handling the async request in background
// await pauses code untill the promise is resolved









//register functionality 
export const register = async (req: Request, res: Response, next: express.NextFunction) => {
    const { username, firstname, lastname, email, password } = req.body;

    //check if all feilds are filled
    if (!username || !firstname || !lastname || !email || !password) {
        res.json({ success: false, message: 'Missing Info' });
        return;
    }
    try {
        //if user alr exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.json({ success: false, message: 'User already exists' });
            return;
        }

        //hash password, 10 bc the hash function is ran 10 rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        //for storing the new hashed password
        const user = new User({ username, firstname, lastname, email, password: hashedPassword })

        //saving it to database
        await user.save();

        //created token, mongoose automatically creates a id feild to any documented created
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        // Set JWT as an HTTP-only cookie so the client stays logged in.
        // This cookie is:
        // - httpOnly: cannot be accessed via JavaScript (protects against XSS)
        // - secure: only sent over HTTPS in production
        // - sameSite: controls cross-site behavior (set to 'none' for cross-origin use in production)
        // - maxAge: cookie lasts for 7 days
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //reistration was completed correctly
        res.json({success: true});



    } catch (error: any) {
        next(error);
    }
}










//login functionality 
export const login = async (req: Request, res: Response, next: express.NextFunction) => {
    const { username, password } = req.body;

    //check if all feilds are filled
    if(!username || !password) {
        res.json({success: false, message: 'username and password required'});
        return;
    }

    try {

        //look for user from username
        const user = await User.findOne({username});
        
        //if username was invalid
        if (!user) {
            res.json({success: false,message: 'invalid username'});
            return;
        }

        // func to compare entered password and database password
        const isSame = await bcrypt.compare(password, user.password);

        //if password was invalid
        if(!isSame) {
            res.json({success: false, message: "invalid password"});
            return;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // login was successfull
        res.json({success: true});


    } catch (error: any) {
        next(error);
    }


}



//logout functionality
export const logout = async (req: Request, res: Response, next: express.NextFunction) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
        })

        res.json({succes: true, message: "Logged Out"})
        

    } catch (error: any) {
        next(error);
    }

}