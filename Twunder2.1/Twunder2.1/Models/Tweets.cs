using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Twunder2._1.Models
{
    public class Tweets
    {
        public DateTime CreatedAt { get; set; }
        public string ProfileImageUrl { get; set; }
        public string Username { get; set; }        
        public string StatusID { get; set; }
        public string Name { get; set; }
        public string Tweet { get; set; }
        public string TweetLink { get; set; }
    }
}