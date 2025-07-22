export interface CreateWorkerProfileDTO {
  bio: string;
  experience: number;
  city: string;
  province: string;
}

export interface UpdateWorkerProfileDTO {
  bio?: string;
  experience?: number;
  city?: string;
  province?: string;
}

export interface AddWorkerSkillDTO {
  workerId: number;
  serviceId : string;
}