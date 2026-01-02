import catchAsync from "../utils/catchAsync.js";
import roomModel from "../models/roomModel.js";
import usermodel from "../models/userModel.js";

export const getRooms = catchAsync(async (req, res, next) => {
  const userToken = req.token;
  const user = await usermodel.findOne({ token: userToken });

  const rooms = await roomModel
    .find({
      members: { $in: [user._id] },
    })
    .populate([
      { path: "members", select: "username profilePicture" },
      {
        path: "messages",
        // select: '',
        populate: [
          { path: "senderId", select: "username profilePicture token -_id" },
          { path: "recieverId", select: "username profilePicture token -_id" },
          { path: "voiceMessage", select: "voice -_id " },
        ],
      },
    ]);
  
  const roomsWithFriend = rooms.map(room => {
    const roomObj = room.toObject ? room.toObject() : room;
    if (roomObj.members && roomObj.members.length === 2) {
      const friend = roomObj.members.find(m => m._id.toString() !== user._id.toString());
      if (friend) {
        roomObj.friend = {
          id: friend._id,
          name: friend.username,
          avatar: friend.profilePicture?.url
        };
      }
    }
    return roomObj;
  });

  return res.status(200).json({
    success: true,
    rooms: roomsWithFriend,
  });
});

export const getRoom = catchAsync(async (req, res, next) => {
  const roomId = req.params.id;

  let room = await roomModel.findOne({ _id: roomId }).populate([
    { path: "members", select: "username profilePicture" },
    {
      path: "messages",
      // select: '',
      populate: [
        { path: "senderId", select: "username token -_id" },
        { path: "recieverId", select: "username token -_id" },
      ],
    },
  ]);

  const roomObj = room.toObject();
  if (roomObj.members.length === 2) {
    const userToken = req.token;
    const currentUser = await usermodel.findOne({ token: userToken });
    const friend = roomObj.members.find(m => m._id.toString() !== currentUser._id.toString());
    if (friend) {
      roomObj.friend = {
        id: friend._id,
        name: friend.username,
        avatar: friend.profilePicture?.url
      };
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      messages: roomObj.messages,
      room: roomObj,
    },
  });
});

export const updateRoom = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    if(!roomId){
        return res.status(400).json({
            success: false,
            message: 'Room ID is required',
        });
    }
    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, req.body, { new: true });
    return res.status(200).json({
        success: true,
        data: updatedRooms,
    });
})

export const deleteRoom = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    if(!roomId){
        return res.status(400).json({
            success: false,
            message: 'Room ID is required',
        });
    }
    const deletedRoom = await roomModel.findByIdAndDelete(roomId);
    return res.status(200).json({
        success: true,
        data: deletedRoom,
    });
})

export const addRoomAdmin = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    const adminId = req.body.adminId;
    if(!roomId || !adminId){
        return res.status(400).json({
            success: false,
            message: 'Room ID and Admin ID are required',
        });
    }
    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, { $push: { groupAdmin: adminId } }, { new: true });
    return res.status(200).json({
        success: true,
        data: updatedRoom,
    });
})

export const removeRoomAdmin = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    const adminId = req.body.adminId;
    if(!roomId || !adminId){
        return res.status(400).json({
            success: false,
            message: 'Room ID and Admin ID are required',
        });
    }
    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, { $pull: { groupAdmin: adminId } }, { new: true });
    return res.status(200).json({
        success: true,
        data: updatedRoom,
    });
})

export const addRoomMember = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    const memberId = req.body.memberId;
    if(!roomId || !memberId){
        return res.status(400).json({
            success: false,
            message: 'Room ID and Member ID are required',
        });
    }
    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, { $push: { members: memberId } }, { new: true });
    return res.status(200).json({
        success: true,
        data: updatedRoom,
    });
})

export const removeRoomMember = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    const memberId = req.body.memberId;
    if(!roomId || !memberId){
        return res.status(400).json({
            success: false,
            message: 'Room ID and Member ID are required',
        });
    }
    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, { $pull: { members: memberId } }, { new: true });
    return res.status(200).json({
        success: true,
        data: updatedRoom,
    });
})

export const updateProfilePicture = catchAsync(async (req, res, next) => {
    const roomId = req.params.id;
    const profilePicture = req.body.profilePicture;
    if(!roomId || !profilePicture){
        return res.status(400).json({
            success: false,
            message: 'Room ID and Profile Picture are required',
        });
    }
    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, { profilePicture }, { new: true });
    return res.status(200).json({
        success: true,
        data: updatedRoom,
    });
})
