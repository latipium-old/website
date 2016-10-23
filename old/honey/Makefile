# Makefile
#
# Copyright (c) 2016 Zach Deibert.
# All Rights Reserved.

CONFIGURATION = Release
DEPLOY = $(DEPLOY_SSH) $(SU) $(INSTALL)
DEPLOY_HOST = latipium-04
DEPLOY_SRV = $(DEPLOY) $(INST_SRV_FLAGS)
DEPLOY_SRV_BIN = $(DEPLOY) $(INST_SRV_BIN_FLAGS)
DEPLOY_SSH = $(SSH) $(DEPLOY_USER)@$(DEPLOY_HOST)
DEPLOY_USER = software-updates
INITD = service
INSTALL = install
INSTALL_DIR = /srv
INST_SRV = $(INSTALL) $(INST_SRV_FLAGS)
INST_SRV_BIN = $(INSTALL) $(INST_SRV_BIN_FLAGS)
INST_SRV_BIN_FLAGS = -D -m 755 -o root
INST_SRV_FLAGS = -D -m 644 -o root
MOUNT = mount
MSBUILD = xbuild
NUGET = nuget
RM = rm -rf
SFTP = sftp
SSH = ssh
SU = sudo
TAR = tar
TRUE = true
UPDATE_INITD = update-rc.d

.PHONY: all
all: \
    bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe \
    bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe.config \
    bin/$(CONFIGURATION)/EntityFramework.dll \
    bin/$(CONFIGURATION)/EntityFramework.SqlServer.dll \
    bin/$(CONFIGURATION)/log4net.dll \
    bin/$(CONFIGURATION)/MySql.Data.dll \
    bin/$(CONFIGURATION)/MySql.Data.Entity.EF6.dll \
    services/honey.daemon \
    services/honey.service \

.PHONY: clean
clean:
	$(RM) bin obj deploy.tar.gz deploy.txt

.PHONY: install
install:
	$(INST_SRV) bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe.config $(INSTALL_DIR)/honey/Com.Latipium.Website.Honey.exe.config
	$(INST_SRV) bin/$(CONFIGURATION)/EntityFramework.dll $(INSTALL_DIR)/honey/EntityFramework.dll
	$(INST_SRV) bin/$(CONFIGURATION)/EntityFramework.SqlServer.dll $(INSTALL_DIR)/honey/EntityFramework.SqlServer.dll
	$(INST_SRV) bin/$(CONFIGURATION)/log4net.dll $(INSTALL_DIR)/honey/log4net.dll
	$(INST_SRV) bin/$(CONFIGURATION)/MySql.Data.dll $(INSTALL_DIR)/honey/MySql.Data.dll
	$(INST_SRV) bin/$(CONFIGURATION)/MySql.Data.Entity.EF6.dll $(INSTALL_DIR)/honey/MySql.Data.Entity.EF6.dll
	$(INST_SRV_BIN) bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe $(INSTALL_DIR)/honey/Com.Latipium.Website.Honey.exe
	$(INST_SRV_BIN) services/honey.daemon /usr/sbin/latipium-honeyd
	$(INST_SRV_BIN) services/honey.service /etc/init.d/latipium-honey
	$(INITD) latipium-honey stop || $(TRUE)
	$(UPDATE_INITD) latipium-honey defaults
	$(INITD) latipium-honey start

.PHONY: deploy
deploy: deploy.tar.gz
	echo "put $<" > deploy.txt
	$(DEPLOY_SSH) $(SU) $(MOUNT) -o remount,rw /
	$(SFTP) -b deploy.txt $(DEPLOY_USER)@$(DEPLOY_HOST)
	$(DEPLOY_SSH) $(TAR) -xzf "$<"
	$(DEPLOY_SRV) bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe.config $(INSTALL_DIR)/honey/Com.Latipium.Website.Honey.exe.config
	$(DEPLOY_SRV) bin/$(CONFIGURATION)/EntityFramework.dll $(INSTALL_DIR)/honey/EntityFramework.dll
	$(DEPLOY_SRV) bin/$(CONFIGURATION)/EntityFramework.SqlServer.dll $(INSTALL_DIR)/honey/EntityFramework.SqlServer.dll
	$(DEPLOY_SRV) bin/$(CONFIGURATION)/log4net.dll $(INSTALL_DIR)/honey/log4net.dll
	$(DEPLOY_SRV) bin/$(CONFIGURATION)/MySql.Data.dll $(INSTALL_DIR)/honey/MySql.Data.dll
	$(DEPLOY_SRV) bin/$(CONFIGURATION)/MySql.Data.Entity.EF6.dll $(INSTALL_DIR)/honey/MySql.Data.Entity.EF6.dll
	$(DEPLOY_SRV_BIN) bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe $(INSTALL_DIR)/honey/Com.Latipium.Website.Honey.exe
	$(DEPLOY_SRV_BIN) services/honey.daemon /usr/sbin/latipium-honeyd
	$(DEPLOY_SRV_BIN) services/honey.service /etc/init.d/latipium-honey
	@echo $(DEPLOY_SSH) $(SU) sed -i -e \"s/Password=12345\;/Password=[REMOVED BY SCRIPT]\;/\" $(INSTALL_DIR)/honey/Com.Latipium.Website.Honey.exe.config
	@$(DEPLOY_SSH) $(SU) sed -i -e \"s/Password=12345\;/Password=$(DATABASE_PASSWORD)\;/\" $(INSTALL_DIR)/honey/Com.Latipium.Website.Honey.exe.config
	$(DEPLOY_SSH) $(SU) $(INITD) latipium-honey stop || $(TRUE)
	$(DEPLOY_SSH) $(SU) $(UPDATE_INITD) latipium-honey defaults
	$(DEPLOY_SSH) $(SU) $(INITD) latipium-honey start
	$(DEPLOY_SSH) $(RM) bin services deploy.tar.gz
	$(DEPLOY_SSH) $(SU) $(MOUNT) -o remount,ro / || $(TRUE)

deploy.tar.gz: all
	$(TAR) -czf "$@" bin/$(CONFIGURATION) services

bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe.config \
bin/$(CONFIGURATION)/EntityFramework.dll \
bin/$(CONFIGURATION)/EntityFramework.SqlServer.dll \
bin/$(CONFIGURATION)/log4net.dll \
bin/$(CONFIGURATION)/MySql.Data.dll \
bin/$(CONFIGURATION)/MySql.Data.Entity.EF6.dll \
: bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe

.PHONY: bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe
bin/$(CONFIGURATION)/Com.Latipium.Website.Honey.exe:
	$(NUGET) restore -SolutionDirectory ..
	$(MSBUILD) Com.Latipium.Website.Honey.csproj /property:Configuration=$(CONFIGURATION)
