import { clerkClient } from "@clerk/express";

// middleware (protect educator routes)
export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId
        const response = await clerkClient.users.getUser(userId)

        if (response.publicMetadata.role !== 'educator') {
            return res.json({success: false,message: 'You are not authorized to access this route'})
        }
    
    
        next()
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}