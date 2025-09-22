// import roomModel from '../models/roomModel.js';
// import voiceModel from '../models/voiceModel.js'
// import catchAsync from '../utils/catchAsync'


// export const sendVoiceMessage = catchAsync(async (req, res, next) => {
//     const receiverId = req.params.id;
//     // const userToken = req.token;
//     const senderId = req.user._id
//     let room = await roomModel.findOne({
//         members: { $all: [senderId, receiverId], $size: 2 },
//     });
// })