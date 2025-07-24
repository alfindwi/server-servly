import { prisma } from "../libs/prisma";
import { v2 as cloudinary } from "cloudinary";
import uploader from "../libs/cloudinary";
import { updateUserDTO } from "../dto/userDto";

export const updateUser = async (
  userId: number,
  data: updateUserDTO,
  file?: Express.Multer.File
) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    let avatarData = {};

    if (file) {
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }

      const uploadResult = await uploader(file);

      avatarData = {
        avatar: uploadResult.secure_url,
        avatarPublicId: uploadResult.public_id,
      };
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        ...avatarData,
      },
    });
  } catch (error) {
    console.log(`Update user error: ${error}`);
    throw error;
  }
};
