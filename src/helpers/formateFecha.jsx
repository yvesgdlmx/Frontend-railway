import moment from 'moment';
import 'moment/locale/es';  // Importamos el locale español

moment.locale('es');  // Configuramos moment para usar español

export const formatearFecha = (fecha) => {
  return moment(fecha).format('DD [de] MMMM [de] YYYY [a las] HH:mm');
};