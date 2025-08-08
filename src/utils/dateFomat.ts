import dayjs from "dayjs";
import "dayjs/locale/id";



export function formatDate(date: Date) {
    return dayjs(date).locale("id").format("DD MMMM YYYY HH:mm");
}
