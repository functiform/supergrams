alphabet = 'abcdefghijklmnopqrstuvwxyz'

wordsFile = open('words.json', 'w')
wordsFile.write('{')
for letter in alphabet:
	with open(letter + ' words.txt') as f:
		content = f.readlines()
		content = [ x.strip() for x in content ] 
		for word in content:
			wordsFile.write("'" + word + "': 1, \n")
