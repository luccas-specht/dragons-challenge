import { SubmitDataDTO, LoggedInUser } from '..';

export type LoggedInUserContextData = {
  user: LoggedInUser;
  login: ({ nickname, password }: SubmitDataDTO) => Promise<void>;
  logOut: () => Promise<void>;
};
