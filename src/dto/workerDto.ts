import { updateUserDTO } from "./userDto";

export interface CreateWorkerProfileDTO {
  userId: number;
  bio: string;
  experience: number;
  city: string;
  province: string;
}

export interface UpdateWorkerProfileDTO extends updateUserDTO {
  bio?: string;
  experience?: number;
  city?: string;
  province?: string;
}

export interface AddWorkerSkillDTO {
  workerId: number;
  serviceId : string;
}