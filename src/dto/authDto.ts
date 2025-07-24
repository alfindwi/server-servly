export interface loginDTO {
  email: string;
  password: string;
}


export interface registerDTO extends loginDTO {
  fullName: string;
}

