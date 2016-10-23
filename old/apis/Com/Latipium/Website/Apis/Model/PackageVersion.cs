// PackageVersion.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Com.Latipium.Website.Apis.Model {
	[Table("versions")]
	public class PackageVersion {
		[Key]
		public int VersionId {
			get;
			set;
		}

		[ForeignKey("Package")]
		public string PackageId {
			get;
			set;
		}

		public virtual Package Package {
			get;
			set;
		}

		public string Title {
			get;
			set;
		}

		public string Description {
			get;
			set;
		}

		public int Created {
			get;
			set;
		}

		[Column("Version")]
		[Index("versions_Version")]
		public string VersionName {
			get;
			set;
		}

		public string PackageHash {
			get;
			set;
		}

		public string PackageHashAlgorithm {
			get;
			set;
		}

		public string Dependencies {
			get;
			set;
		}

		public int PackageSize {
			get;
			set;
		}

		public string ReleaseNotes {
			get;
			set;
		}

		public int VersionDownloadCount {
			get;
			set;
		}

		public string Tags {
			get;
			set;
		}

		public string LicenseUrl {
			get;
			set;
		}

		public string ProjectUrl {
			get;
			set;
		}

		public string IconUrl {
			get;
			set;
		}

		public string Authors {
			get;
			set;
		}

		public string Owners {
			get;
			set;
		}

		public bool RequireLicenseAcceptance {
			get;
			set;
		}

		public string Copyright {
			get;
			set;
		}

		public bool IsPrerelease {
			get;
			set;
		}
	}
}

