using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using LinqToTwitter;
using LinqToTwitter.Security;
using System.Threading.Tasks;

namespace Twunder2._1.Controllers
{
    public class HomeController : AsyncController
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Search()
        {
            return View();
        }
    }
}
