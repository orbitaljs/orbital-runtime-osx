#/bin/bash
set -euo pipefail

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
BUILD_DIR=$DIR/_tmp

echo \* Building to $BUILD_DIR

mkdir _dl || true

rm -rf _tmp || true
mkdir _tmp

if [ -f _dl/jdk-8u45-macosx-x64.dmg ];
then
	echo "OSX JDK already downloaded, skipping"
else
	wget -P _dl --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie;" \
		http://download.oracle.com/otn-pub/java/jdk/8u45-b14/jdk-8u45-macosx-x64.dmg
fi

if [ -f _dl/electron-v0.27.2-darwin-x64.zip ];
then
	echo "Electron Shell already downloaded, skipping"
else
	wget -P _dl https://github.com/atom/electron/releases/download/v0.27.2/electron-v0.27.2-darwin-x64.zip
fi

cd _tmp
rm log || true

echo ==================
echo Extracting OSX JDK
echo ==================
echo

echo Extracting outer DMG
7z -y x ../_dl/jdk*.dmg >> log
echo Extracting HFS
7z -y x *.hfs >> log
rm [0-9].*

mv JDK*/*.pkg .
echo Extracting JDK pkg
7z -y x JDK*.pkg >> log
rm -rf JDK*
rm *.xml

mv jdk*.pkg/Payload .
rm -rf *.pkg
echo Extracting JDK sub-pkg 1/2
7z -y x Payload >> log
echo Extracting JDK sub-pkg 2/2
7z -y -ojdk x Payload~ >> log

rm Payload*

echo
echo ===================
echo Extracting Electron
echo ===================
echo

echo Extracting Electron Shell
7z x ../_dl/electron*.zip >> log

echo Moving JRE
mv jdk/Contents/Home/jre Electron.app/Contents/Java

cd Electron.app/Contents/Java 

rm -rf bin/
rm -rf lib/deploy/
rm -rf lib/deploy.jar
rm -rf lib/javaws.jar
rm -rf lib/libdeploy.dylib
rm -rf lib/libnpjp2.dylib
rm -rf lib/plugin.jar
rm -rf lib/security/javaws.policy

cd $BUILD_DIR

echo Installing native code
mkdir -p Electron.app/Contents/lib/node

cd $DIR/orbital

export npm_config_disturl=https://atom.io/download/atom-shell
export npm_config_target=0.25.0
export npm_config_arch=x64
HOME=~/.electron-gyp npm install >> $BUILD_DIR/log

cd $DIR
cp -aR orbital $BUILD_DIR/Electron.app/Contents/lib/node/orbital
