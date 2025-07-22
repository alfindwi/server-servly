export interface loginDTO {
  email: string;
  password: string;
}


export interface registerDTO extends loginDTO {
  fullName: string;
}

export interface updateUserDTO {
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}