// ApiSubsystem.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using log4net;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api {
	public class ApiSubsystem : ISubsystem {
		private static readonly ILog Log = LogManager.GetLogger(typeof(ApiSubsystem));
		private static ApiSubsystem Instance;
		private Dictionary<int, Dictionary<string, IApi>> Apis;
		private Dictionary<int, Dictionary<string, ICIApi>> CIApis;
		private IBackgroundApi[] BackgroundApis;

		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "Api-Subsystem";
			}
		}

		public void Init() {
			IApi[] apis = typeof(ApiSubsystem).Assembly.GetExportedTypes()
				.Where(
				t => typeof(IApi).IsAssignableFrom(t) && !t.IsInterface
			).Select(
				t => t.GetConstructor(new Type[0])
					.Invoke(new object[0])
			).Cast<IApi>()
				.ToArray();
			Apis = apis.GroupBy(
				api => api.Version
			).ToDictionary(
				g => g.Key,
				g => g.ToDictionary(
					api => api.Name
				)
			);
			CIApis = apis.Where(
				api => api is ICIApi
			).Cast<ICIApi>()
				.GroupBy(
					api => api.Version
			).ToDictionary(
				g => g.Key,
				g => g.ToDictionary(
					api => api.Name
				)
			);
			BackgroundApis = apis.Where(
				api => api is IBackgroundApi
			).Cast<IBackgroundApi>()
				.ToArray();
			foreach ( IApi api in apis ) {
				api.Database = Database;
			}
		}

		public void Start() {
			Instance = this;
			if ( BackgroundApis.Length > 0 ) {
				while ( true ) {
					foreach ( IBackgroundApi api in BackgroundApis ) {
						api.BackgroundTask();
					}
					Thread.Yield();
				}
			}
		}

		private static ApiResponse FailAll(ApiInitRequest req) {
			ApiResponse res = new ApiResponse();
			res.failed_queries.AddRange(req.queries);
			return res;
		}

		private bool ProcessApi(IApi api, string userId, List<string> headers, ApiQuery query, out object response, List<Action<ApiResponse>> postProcessors) {
			object _response = null;
			try {
				if ( api is ILowLevelApi ) {
					object state;
					_response = ((ILowLevelApi) api).Process(query.GetData(api.RequestType), userId, headers, out state);
					postProcessors.Add(res => ((ILowLevelApi) api).ProcessResult(headers, res, state));
				} else {
					_response = api.Process(query.GetData(api.RequestType), userId);
				}
				return true;
//#if DEBUG
			} catch ( Exception ex ) {
				Log.Info(ex);
//#else
//			} catch ( Exception ) {
//#endif
				return false;
			} finally {
				response = _response;
			}
		}

		private bool ProcessApi(ICIApi api, CIToken token, List<string> headers, ApiQuery query, out object response, List<Action<ApiResponse>> postProcessors) {
			object _response = null;
			try {
				_response = api.Process(query.GetData(api.RequestType), token);
				return true;
#if DEBUG
			} catch ( Exception ex ) {
				Log.Info(ex);
#else	
			} catch ( Exception ) {
#endif
				return false;
			} finally {
				response = _response;
			}
		}

		public ApiResponse ProcessReq(ApiInitRequest req, string userId, List<string> headers) {
			if ( Apis.ContainsKey(req.version) ) {
				List<Action<ApiResponse>> postProcessors = new List<Action<ApiResponse>>();
				Dictionary<string, IApi> apis = Apis[req.version];
				ApiResponse res = new ApiResponse();
				foreach ( ApiQuery query in req.queries ) {
					object result;
					if ( apis.ContainsKey(query.type) && ProcessApi(apis[query.type], userId, headers, query, out result, postProcessors) ) {
						res.successful_queries.Add(query);
						res.query_results.Add(result);
					} else {
#if DEBUG
						Log.InfoFormat("Unable to {1} api {0}", query.type, apis.ContainsKey(query.type) ? "run": "find");
#endif
						res.failed_queries.Add(query);
					}
				}
				foreach ( Action<ApiResponse> proc in postProcessors ) {
					proc(res);
				}
				return res;
			} else {
#if DEBUG
				Log.InfoFormat("Unable to find version {0}", req.version);
#endif
				return FailAll(req);
			}
		}

		public ApiResponse ProcessReq(ApiInitRequest req, CIToken token, List<string> headers) {
			if ( CIApis.ContainsKey(req.version) ) {
				List<Action<ApiResponse>> postProcessors = new List<Action<ApiResponse>>();
				Dictionary<string, ICIApi> apis = CIApis[req.version];
				ApiResponse res = new ApiResponse();
				foreach ( ApiQuery query in req.queries ) {
					object result;
					if ( apis.ContainsKey(query.type) && ProcessApi(apis[query.type], token, headers, query, out result, postProcessors) ) {
						res.successful_queries.Add(query);
						res.query_results.Add(result);
					} else {
#if DEBUG
						Log.InfoFormat("Unable to {1} api {0}", query.type, apis.ContainsKey(query.type) ? "run": "find");
#endif
						res.failed_queries.Add(query);
					}
				}
				foreach ( Action<ApiResponse> proc in postProcessors ) {
					proc(res);
				}
				return res;
			} else {
#if DEBUG
				Log.InfoFormat("Unable to find version {0}", req.version);
#endif
				return FailAll(req);
			}
		}

		public static ApiResponse Process(ApiInitRequest req, string userId, List<string> headers) {
			if ( Instance == null ) {
				Log.Warn("Unable to get instance of API subsystem");
				return FailAll(req);
			} else {
				return Instance.ProcessReq(req, userId, headers);
			}
		}

		public static ApiResponse Process(ApiInitRequest req, CIToken token, List<string> headers) {
			if ( Instance == null ) {
				Log.Warn("Unable to get instance of API subsystem");
				return FailAll(req);
			} else {
				return Instance.ProcessReq(req, token, headers);
			}
		}
	}
}

