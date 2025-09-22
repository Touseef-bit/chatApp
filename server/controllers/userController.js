import catchAsync from '../utils/catchAsync.js'
import usermodel from '../models/userModel.js'
import roomModel from '../models/roomModel.js'


export const getAllUsers = catchAsync(async (req, res, next) => {
    const userToken = req.token;
    const userId = req.user._id;

    const rooms = await roomModel.find({
        members: { $in: [userId] }
    });

    const allUsers = await usermodel
        .find({ _id: { $ne: userId } })
        .select("-email -password -token");

    const connectedUserIds = new Set();

    rooms.forEach(room => {
        if (room.members.length == 2) {
            room.members.forEach(memberId => {
                if (String(memberId) !== String(userId)) {
                    connectedUserIds.add(String(memberId));
                }
            });
        }
    });


    const users = await usermodel
        .find({
            token: { $ne: userToken },
            _id: {
                $nin: Array.from(connectedUserIds)
            }
        })
        .select("-email -password -token");

    return res.status(200).json({
        success: true,
        users,    
        allUsers, 
    });
})


export const uploadProfile = catchAsync(async (req, res, next) => {
    const userToken = req.token;

    const user = await usermodel.findOne({ token: userToken });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    if (!req.file || !req.file.path) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }


    user.profilePicture = {
        url: req.file.path,
    };

    await user.save();

    return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully!",
        url: user.profilePicture.url,
    });
});
