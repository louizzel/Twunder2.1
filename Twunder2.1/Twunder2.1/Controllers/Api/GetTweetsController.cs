using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using LinqToTwitter;
using LinqToTwitter.Security;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Twunder2._1.Models;

namespace Twunder2._1.Controllers.Api
{
    public class GetTweetsController : ApiController
    {
        public List<Status> Get(string query)
        {
            try
            {
                var _auth = new MvcAuthorizer
                {
                    CredentialStore = new SessionStateCredentialStore()
                };
                //_auth.Credentials = new InMemoryCredentials
                //{
                //    ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                //    ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                //};

                //_auth.Authorize();                

                var result = new List<Status>();

                using (var twitterContext = new TwitterContext(_auth))
                {
                    var gatherMore = true;
                    ulong maxID = 0;
                    while (gatherMore)
                    {
                        var temp = (from search in twitterContext.Search
                                    where search.Type == SearchType.Search && search.Count == 1000
                                              && search.Query == query && search.MaxID == maxID
                                        //Tweets older than date
                                              && search.Until == DateTime.Parse("06-08-2014")
                                    select search).SingleOrDefault().Statuses;
                        result.AddRange(temp);
                        if (temp.Count <= 1)
                            gatherMore = false;
                        else
                        {
                            maxID = temp[temp.Count - 1].StatusID;
                            var date = new DateTime(2014, 06, 05, 15, 00, 00);
                            if (temp[temp.Count - 1].CreatedAt <= date)
                                gatherMore = false;
                        }
                    }
                };
                WriteFile(result.GroupBy(m => m.StatusID).Select(n => n.First()).OrderByDescending(s => s.StatusID).ToList(), query);
                return result.GroupBy(m => m.StatusID).Select(n => n.First()).OrderByDescending(s => s.StatusID).ToList();
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }

        public List<Status> Get(string query, string sinceID)
        {
            try
            {
                var _auth = new MvcAuthorizer
                {
                    CredentialStore = new SessionStateCredentialStore()
                };
                //_auth.Credentials = new InMemoryCredentials
                //{
                //    ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                //    ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                //};

                //_auth.Authorize();

                var result = new List<Status>();

                using (var twitterContext = new TwitterContext(_auth))
                {
                    var gatherMore = true;
                    while (gatherMore)
                    {
                        var temp = (from search in twitterContext.Search
                                    where search.Type == SearchType.Search && search.Count == 1000
                                              && search.Query == query && search.SinceID == ulong.Parse(sinceID)
                                              && search.Until == DateTime.Parse("06-07-2014") && search.ResultType == ResultType.Recent
                                    select search).SingleOrDefault().Statuses;
                        result.AddRange(temp);
                        if (temp.Count <= 1)
                            gatherMore = false;
                        else
                            sinceID = temp[0].StatusID.ToString();
                    }
                }

                return result.GroupBy(m => m.StatusID).Select(n => n.First()).OrderBy(s => s.StatusID).ToList();
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }

        public async Task<List<Twunder2._1.Models.Tweets>> Get(string query, ulong maxID, string toDate, string fromDate)
        {
            try
            {
                var _auth = new SingleUserAuthorizer
                {
                    CredentialStore = new SingleUserInMemoryCredentialStore
                    {
                        ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                        ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"],
                        AccessToken = System.Configuration.ConfigurationManager.AppSettings["AccessToken"],
                        AccessTokenSecret= System.Configuration.ConfigurationManager.AppSettings["AccessTokenSecret"]
                    }
                };

                var result = new List<Tweets>();

                using (var twitterContext = new TwitterContext(_auth))
                {
                    if (string.IsNullOrEmpty(toDate))
                    {
                        var temp = await (from search in twitterContext.Search
                                          where search.Type == SearchType.Search && search.Count == 1000
                                                    && search.Query == query && search.MaxID == maxID
                                          select search).SingleOrDefaultAsync();
                        foreach (var each in temp.Statuses)
                        {
                            var temporaryTweet = new Twunder2._1.Models.Tweets();
                            temporaryTweet.CreatedAt = each.CreatedAt;
                            temporaryTweet.ProfileImageUrl = each.User.ProfileImageUrl;
                            temporaryTweet.Username = each.User.ScreenNameResponse;
                            temporaryTweet.StatusID = each.StatusID.ToString();
                            temporaryTweet.Name = each.User.Name;
                            temporaryTweet.Tweet = each.Text.Replace("\n", " ").Replace("\r\n", " ").Replace("\r", " ");
                            temporaryTweet.TweetLink = "https://twitter.com/" + each.User.ScreenNameResponse + "/status/" + each.StatusID.ToString();
                            result.Add(temporaryTweet);
                        }
                        return result;
                    }
                    else
                    {
                        var temp = await (from search in twitterContext.Search
                                where search.Type == SearchType.Search && search.Count == 1000
                                          && search.Query == query && search.MaxID == maxID
                                          && search.Until == DateTime.Parse(toDate).AddDays(1)
                                          select search).SingleOrDefaultAsync();
                        foreach (var each in temp.Statuses)
                        {
                            var temporaryTweet = new Twunder2._1.Models.Tweets();
                            temporaryTweet.CreatedAt = each.CreatedAt;
                            temporaryTweet.ProfileImageUrl = each.User.ProfileImageUrl;
                            temporaryTweet.Username = each.User.ScreenNameResponse;
                            temporaryTweet.StatusID = each.StatusID.ToString();
                            temporaryTweet.Name = each.User.Name;
                            temporaryTweet.Tweet = each.Text.Replace("\n", " ").Replace("\r\n", " ").Replace("\r", " ");
                            temporaryTweet.TweetLink = "https://twitter.com/" + each.User.ScreenNameResponse + "/status/" + each.StatusID.ToString();
                            result.Add(temporaryTweet);
                        }
                        return result;
                    }
                };
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }

        public void WriteFile(List<Status> data, string query)
        {
            string fileName = @"C:\wamp\" + query + ".csv";

            try
            {
                // Check if file already exists. If yes, delete it. 
                var ctr = 1;
                while (File.Exists(fileName))
                {
                    fileName = @"C:\wamp\" + query + "(" + ctr + ").csv";
                    ctr++;
                }

                // Create a new file 
                using (FileStream fs = File.Create(fileName))
                {
                    byte[] header = new UTF8Encoding(true).GetBytes("Date,User Id,Tweet,Link" + "\n");
                    fs.Write(header, 0, header.Length);

                    foreach (var temp in data)
                    {
                        byte[] line = new UTF8Encoding(true).GetBytes(temp.CreatedAt.AddHours(8) + "," + temp.User.UserID + "," + temp.Text.Replace("\n", " ").Replace("\r\n", " ").Replace("\r", " ") + ",https://twitter.com/" + temp.User.UserID + "/status/" + temp.StatusID + "\n");
                        fs.Write(line, 0, line.Length);
                    }
                }
            }
            catch (Exception Ex)
            {
                throw new Exception("An error occured. Please check your network connection. " + Ex.Message);
            }
        }
    }
}
