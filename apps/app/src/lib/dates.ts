import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import 'dayjs/locale/en';

dayjs.extend(buddhistEra);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export { dayjs };
export type DateInput = string | number | Date | dayjs.Dayjs;
