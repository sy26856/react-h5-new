/*
 * @Author: saohui 
 * @Date: 2017-09-26 09:37:29 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-10-20 09:47:29
 */
import myFollow from './model/my-follow'
import createConsultation from './model/create-consultation'

export default function setModel ( app ) {
  app.model( myFollow )
  app.model( createConsultation )
}