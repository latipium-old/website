// Package.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Apis.Model {
	[Table("packages")]
	public class Package {
		[Key]
		public string PackageId {
			get;
			set;
		}

		[Index("packages_Title")]
		public string Title {
			get;
			set;
		}

		[Index("packages_DownloadCount")]
		public int DownloadCount {
			get;
			set;
		}

		public string LatestVersion {
			get;
			set;
		}
	}
}

