// UploadModule.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml;
using ICSharpCode.SharpZipLib.Zip;
using Newtonsoft.Json;
using Org.BouncyCastle.Crypto.Digests;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis.Api.V1 {
	public class UploadModule : IApi, ICIApi {
		private const string NuSpecXsd = "http://schemas.microsoft.com/packaging/2011/08/nuspec.xsd";

		public Storage Database {
			get;
			set;
		}

		public string Name {
			get {
				return "publishModule";
			}
		}

		public int Version {
			get {
				return 1;
			}
		}

		public Type RequestType {
			get {
				return typeof(string);
			}
		}

		private XmlElement GetSingletonElement(XmlElement scope, string name) {
			XmlNodeList list = scope.GetElementsByTagName(name, NuSpecXsd);
			return list.Cast<XmlElement>().FirstOrDefault();
		}

		private string FindSpecItem(XmlElement metadata, string name) {
			XmlElement element = GetSingletonElement(metadata, name);
			if ( element == null ) {
				throw new ArgumentOutOfRangeException(string.Format("{0} not found in metadata", name));
			}
			return element.InnerText;
		}

		private XmlElement DiscoverSpec(Upload upload, out string _id, out string _version, out string _title) {
			string id = null;
			string version = null;
			string title = null;
			try {
				int nuspecs = 0;
				XmlElement metadata = null;
				using ( MemoryStream mem = new MemoryStream(upload.Data, false) ) {
					using ( ZipInputStream zip = new ZipInputStream(mem) ) {
						ZipEntry entry;
						while ( (entry = zip.GetNextEntry()) != null ) {
							if ( entry.Name.EndsWith(".nuspec") ) {
								if ( ++nuspecs > 1 ) {
									throw new OverflowException("Multiple specifications found");
								}
								XmlDocument doc = new XmlDocument();
								doc.Load(zip);
								metadata = GetSingletonElement(doc.DocumentElement, "metadata");
								if ( metadata == null ) {
									throw new ArgumentOutOfRangeException("Metadata not found in specification");
								}
								id = FindSpecItem(metadata, "id");
								version = FindSpecItem(metadata, "version");
								title = FindSpecItem(metadata, "title");
							}
						}
					}
				}
				return metadata;
			} finally {
				_id = id;
				_version = version;
				_title = title;
			}
		}

		private void CheckSpec(string id, string version, Func<string, bool> authentication) {
			if ( id == null || version == null ) {
				throw new NullReferenceException("id or version not found in package");
			}
			if ( !authentication(id) ) {
				throw new AccessViolationException("User does not have permission to publish module");
			}
		}

		private void SetPackageAndVersion(PackageVersion pkgVer, string id, string version, string title) {
			pkgVer.VersionName = version;
			pkgVer.Title = title;
			Package pkg = Database.NuGet.Packages.FirstOrDefault(
					p => p.PackageId == id);
			if ( pkg == null ) {
				pkg = new Package();
				pkg.DownloadCount = 0;
				pkg.PackageId = id;
				Database.NuGet.Packages.Add(pkg);
			}
			pkg.LatestVersion = version;
			pkg.Title = title;
			pkgVer.Package = pkg;
			pkgVer.PackageId = id;
			pkgVer.IsPrerelease = version.Contains('-');
		}
			
		private void ComputeHash(PackageVersion pkgVer, Upload upload) {
			Sha512Digest digest = new Sha512Digest();
			digest.BlockUpdate(upload.Data, 0, upload.Data.Length);
			byte[] hash = new byte[digest.GetDigestSize()];
			digest.DoFinal(hash, 0);
			pkgVer.PackageHash = Convert.ToBase64String(hash);
			pkgVer.PackageHashAlgorithm = digest.AlgorithmName;
			pkgVer.PackageSize = upload.Data.Length;
		}

		private void CopyMetadata(XmlElement metadata, PackageVersion pkgVer) {
			pkgVer.Authors = FindSpecItem(metadata, "authors");
			pkgVer.Copyright = FindSpecItem(metadata, "copyright");
			pkgVer.Description = FindSpecItem(metadata, "description");
			pkgVer.IconUrl = FindSpecItem(metadata, "iconUrl");
			pkgVer.LicenseUrl = FindSpecItem(metadata, "licenseUrl");
			pkgVer.Owners = FindSpecItem(metadata, "owners");
			pkgVer.ProjectUrl = FindSpecItem(metadata, "projectUrl");
			pkgVer.ReleaseNotes = FindSpecItem(metadata, "releaseNotes");
			pkgVer.RequireLicenseAcceptance = FindSpecItem(metadata, "requireLicenseAcceptance") == "true";
			pkgVer.Tags = FindSpecItem(metadata, "tags");
		}

		private void SetDefaults(PackageVersion pkgVer) {
			pkgVer.Created = 0;
			pkgVer.VersionDownloadCount = 0;
		}

		private void CopyDependency(List<Dependency> deps, XmlElement xmlDep, string framework) {
			Dependency dep = new Dependency();
			dep.Framework = framework;
			dep.Id = xmlDep.GetAttribute("id");
			dep.Version = xmlDep.GetAttribute("version");
			deps.Add(dep);
		}

		private void CopyDependencyGroup(List<Dependency> deps, XmlElement xmlDeps) {
			string framework = xmlDeps.HasAttribute("targetFramework") ? xmlDeps.GetAttribute("targetFramework") : null;
			foreach ( XmlElement dep in xmlDeps.ChildNodes.Cast<XmlElement>().Where(e => e.Name == "dependency") ) {
				CopyDependency(deps, dep, framework);
			}
			foreach ( XmlElement group in xmlDeps.ChildNodes.Cast<XmlElement>().Where(e => e.Name == "group") ) {
				CopyDependencyGroup(deps, group);
			}
		}

		private void SetDependencies(PackageVersion pkgVer, XmlElement metadata) {
			XmlElement xmlDeps = GetSingletonElement(metadata, "dependencies");
			if ( xmlDeps == null ) {
				throw new ArgumentOutOfRangeException("Unable to find dependencies element");
			}
			List<Dependency> deps = new List<Dependency>();
			CopyDependencyGroup(deps, xmlDeps);
			pkgVer.Dependencies = JsonConvert.SerializeObject(deps);
		}

		private void FinishUpload(PackageVersion pkgVer, Upload upload, string id, string version) {
			Database.NuGet.Versions.Add(pkgVer);
			Database.NuGet.SaveChanges();
			string dir = Path.Combine("/var/local/packages", id);
			if ( !Directory.Exists(dir) ) {
				Directory.CreateDirectory(dir);
			}
			File.WriteAllBytes(Path.Combine(dir, string.Concat(version, ".nupkg")), upload.Data);
		}

		private void EnsureNotDuplicated(string id, string version) {
			if ( Database.NuGet.Versions.Any(v => v.PackageId == id && v.VersionName == version) ) {
				throw new ArgumentException("This package has already been uploaded");
			}
		}

		public void Upload(object req, Func<string, bool> authentication) {
			Upload upload;
			if ( !Database.Temporary.Uploads.TryGetValue((string) req, out upload) ) {
				throw new NullReferenceException("Upload does not exist");
			}
			string id, version, title;
			XmlElement metadata = DiscoverSpec(upload, out id, out version, out title);
			CheckSpec(id, version, authentication);
			EnsureNotDuplicated(id, version);
			PackageVersion pkgVer = new PackageVersion();
			SetDefaults(pkgVer);
			SetPackageAndVersion(pkgVer, id, version, title);
			ComputeHash(pkgVer, upload);
			CopyMetadata(metadata, pkgVer);
			SetDependencies(pkgVer, metadata);
			FinishUpload(pkgVer, upload, id, version);
		}

		public object Process(object req, string userId) {
			Upload(req, id => Database.Permanent.Authors.Any(
				a => a.UserId == userId && a.Namespace == id
			));
			return null;
		}

		public object Process(object req, CIToken token) {
			Upload(req, id => token.ModuleId == id);
			return null;
		}
	}
}

