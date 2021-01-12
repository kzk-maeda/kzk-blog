import dayjs from 'dayjs';
import 'dayjs/locale/ja';

function formatDate (date: Date, format: string): string {
    const formated = dayjs(date)
        .locale('ja')
        .format(format)
    return formated;
  };

export default formatDate