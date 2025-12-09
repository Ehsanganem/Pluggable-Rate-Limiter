export type LogMessage = {
  type: "log";
  key: string; // ip or user id
  allowed: boolean; // true if request was allowed
};
