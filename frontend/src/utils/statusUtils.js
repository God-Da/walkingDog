import { STATUS_COLORS, STATUS_TEXT_COLORS, STATUS_EMOJIS } from "../constants/statusConstants";

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.default;
};

export const getStatusTextColor = (status) => {
  return STATUS_TEXT_COLORS[status] || STATUS_TEXT_COLORS.default;
};

export const getStatusEmoji = (status) => {
  return STATUS_EMOJIS[status] || STATUS_EMOJIS.default;
};
