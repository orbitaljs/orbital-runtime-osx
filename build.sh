#/bin/bash
set -euo pipefail
#rm -rf _tmp || true;
#mkdir _tmp
cd _tmp
rm log

if [ -f jdk-8u45-macosx-x64.dmg ];
then
	echo "Already downloaded, skipping"
else
	wget --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie;" \
		http://download.oracle.com/otn-pub/java/jdk/8u45-b14/jdk-8u45-macosx-x64.dmg
fi

echo Extracting outer DMG
7z -y x jdk*.dmg >> log
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
