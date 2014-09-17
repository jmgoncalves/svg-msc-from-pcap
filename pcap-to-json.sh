#!/bin/bash
# $1 source PCAP
# $2 wireshark filter to use
# $3 target JSON file

# Fail if target file doesn't exist
if [ ! -f $3 ]; then
	echo "$2 doesn't exist! Exiting..."
	exit -1
fi

echo "Updating $3 with messages found in $1 using filter $2..."

# Set internal field separator to nothing
OIFS=$IFS
IFS=''

# Cleanup
if [ -f tmpfile.json ]; then
	rm tmpfile.json
fi
touch tmpfile.json

# Copy defined entites in JSON
while read line; do
	echo $line >> tmpfile.json
	if [[ $line == *messages* ]]; then
		break;
	fi
done < $3

# Set internal field separator to space
IFS=' '

# Process PCAP file to add messages to JSON
first=true
tshark -r $1 -2 -R "$2" | while read line; do
	declare -a register=($line)
	value="${register[7]} ${register[8]} ${register[9]}" # assummes value has 3 "words"
	if $first ; then
		echo -n '    {"id":'"${register[0]}"',"source":"'"${register[2]}"'","destination":"'"${register[4]}"'","protocol":"'"${register[5]}"'","value":"'"$value"'"}' >> tmpfile.json
	else
		echo -ne ',\n    {"id":'"${register[0]}"',"source":"'"${register[2]}"'","destination":"'"${register[4]}"'","protocol":"'"${register[5]}"'","value":"'"$value"'"}' >> tmpfile.json
	fi
	first=false
done

# Close JSON
echo -e '\n  ]' >> tmpfile.json
echo '}' >> tmpfile.json

# Replace file
rm $3
mv tmpfile.json $3

# Restore IFS
IFS=$OIFS