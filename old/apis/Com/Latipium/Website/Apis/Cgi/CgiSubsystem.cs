// CgiSubsystem.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;
using System.Net;
using System.Threading;
using FastCGI;
using log4net;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Cgi {
	public class CgiSubsystem : ISubsystem {
		private static readonly ILog Log = LogManager.GetLogger(typeof(CgiSubsystem));
		private FCGIApplication App;
		private IEndpoint[] Endpoints;

		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "Cgi-Subsystem";
			}
		}

		public void Init() {
			App = new FCGIApplication();
			App.OnRequestReceived += (sender, req) => {
				string url = req.GetParameterASCII("REQUEST_URI");
				foreach ( IEndpoint endpoint in Endpoints ) {
					if ( endpoint.CanHandle(url) ) {
						endpoint.Handle(req, url);
						return;
					}
				}
				req.WriteResponseASCII("HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\n");
				req.WriteResponseUtf8("Not found.");
				req.Close();
			};
			Endpoints = typeof(CgiSubsystem).Assembly.GetExportedTypes().Where(
				t => typeof(IEndpoint).IsAssignableFrom(t) && t != typeof(IEndpoint)
			).Select(
				t => t.GetConstructor(new Type[0])
				.Invoke(new object[0])
			).Cast<IEndpoint>()
				.ToArray();
			foreach ( IEndpoint endpoint in Endpoints ) {
				endpoint.Init(Database);
			}
			Log.Info("CGI Subsystem initialized");
		}

		public void Start() {
			Log.Info("Running CGI subsystem on fastcgi://0.0.0.0:9000");
			App.Listen(new IPEndPoint(IPAddress.Any, 9000));
			while ( !App.IsStopping ) {
				if ( !App.Process() ) {
					Thread.Yield();
				}
			}
			Log.Info("CGI System shutdown");
		}
	}
}

