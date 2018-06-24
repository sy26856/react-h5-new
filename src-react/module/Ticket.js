//无缓存数据
import JSONPAsyncData from '../lib/JSONPAsyncData'
//优先读取缓存数据
import JSONPCacheAsyncData from '../lib/JSONPCacheAsyncData'
import {TICKET_DOMAIN} from '../config'
import util from '../lib/util';

const query = util.query();
const uid = query.unionId;

function getAPIUri(path) {
  return TICKET_DOMAIN + path
}

function isRoute() {
  //当App版本小于3.5.0时，访问api-uat
  if (util.isInYuantuApp() && util.version.lt(3, 5, 0)) {
    return false;
  }
  return true;
}

export default {
  getUserInfo(unionId = uid){
    return new JSONPAsyncData(getAPIUri('/user/getUserInfo'), {
      origin: 2,
      unionId,
      route: isRoute()
    });
  },
  getTicketList(unionId = uid){
    return new JSONPCacheAsyncData(getAPIUri('/ticket/client/getTicketList'), {
      pageSize: 50,
      unionId,
      route: isRoute()
    });
  },
  getProductList(pageSize, pageNum, unionId = uid){
    return new JSONPCacheAsyncData(getAPIUri('/product/client/getProductList'), {
      unionId,
      route: isRoute()
    });
  },
  createTicket(productId, content, contact, type, enclosure, externalId, unionId = uid){
    return new JSONPCacheAsyncData(getAPIUri('/ticket/client/createTicket'), {
      productId: productId,
      content: content,
      contact: contact,
      extend: type,
      enclosure: enclosure,
      externalId,
      unionId,
      route: isRoute()
    });
  },
  getTicketDetail(unionId = uid, ticketId, blackId){
    return new JSONPAsyncData(getAPIUri('/ticket/client/getTicketDetail'), {
      ticketId: ticketId,
      blackId,
      unionId,
      route: isRoute()
    });
  },
  closeTicket(ticketId, unionId = uid){
    return new JSONPAsyncData(getAPIUri('/ticket/client/closeTicket'), {
      ticketId: ticketId,
      resolved: 1,
      ratings: 5,
      unionId,
      route: isRoute()
    });
  },
  replyTicket(ticketId, content, unionId = uid){
    return new JSONPAsyncData(getAPIUri('/ticket/client/replyTicket'), {
      ticketId: ticketId,
      content: content,
      unionId,
      route: isRoute()
    });
  },
  getIssueProductList(unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/product/h5/getProductList'), {
      unionId,
      route: isRoute()
    });
  },
  getIssueList(productId, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/issue/getIssueList'), {
      productId,
      unionId,
      route: isRoute()
    });
  },
  getIssueDetail(issueId, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/issue/getIssueDetail'), {
      issueId,
      unionId,
      route: isRoute()
    });
  }
}