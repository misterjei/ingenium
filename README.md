# Ingenium: Latin Grammar Puzzle Blocks
## Engaging Novice Students with Puzzles Representing Grammatical Concepts

### Live at [TeachMeLatin.com](http://TeachMeLatin.com)

_Inspired by Scratch. Built on Blockly._

![](http://sharonzhou.me/jigsaw/app/latin/video/instructions.mp4)

## Publications
### ACM CHI
![](https://www.youtube.com/watch?time_continue=1&v=XZsQH5kVLB0)

Sharon Zhou, Ivy Livingston, Mark Schiefsky, Stuart Shieber, and Krzysztof Z. Gajos. [Ingenium: Engaging Novice Students with Latin Grammar](https://dash.harvard.edu/handle/1/24833590). In _Proceedings of the 34th Annual ACM Conference on Human Factors in Computing Systems_ (_CHI_ '16), San Jose, CA, May 7-12, 2016.

- This work was published in one of the top computer science venues in the world, the [ACM Conference on Human Factors in Computing Systems (CHI)](https://en.wikipedia.org/wiki/Conference_on_Human_Factors_in_Computing_Systems "CHI Publication").

![![Video](https://www.youtube.com/watch?time_continue=1&v=XZsQH5kVLB0)](https://www.youtube.com/watch?time_continue=1&v=XZsQH5kVLB0)

### Harvard Thesis
[Engineering Ingenium: Improving Engagement and Accuracy With the Visualization of Latin for Language Learning](https://dash.harvard.edu/handle/1/14398527 "Thesis")

- This work was also published as an undergraduate thesis, representing the first time in Harvard's history that computer science and Classics were combined in a degree as a joint concentration (double major). 

- It was done in collaboration with four Harvard professors, two in computer science and two in Classics.

## Author
[Sharon Zhou](http://sharonzhou.me) ([@sharonzhou](https://github.com/sharonzhou))

### Forking & Modifications
Please fork! :) 

For those making modifications, (1) I welcome it wholeheartedly and (2) I give a _caveat emptor_ in advance, and a couple nota bene:

- The code is well-commented, but can be unwieldly as it had to modify the Blockly library source code directly to make the desirable changes.

- Modified code is commented with `//***` in Blockly library files.

#### Customizing Practice Sentences
##### Inspect the Dictionary, and Add Words to the Dictionary
The public version enables you to add nouns, adjectives, verbs, prepositions, and adverbs. There are two places in the file [POSfactory.js](https://github.com/sharonzhou/ingenium/app/blocks/POSfactory.js) in which you should add your new words. 
	
1. Add the word into the ToolTips object, following its part of speech. This will show when hovering over the block as a dictionary gloss. 
	
2. Find the word's corresponding part of speech under the ToolTips. Add the word and, if applicable, its relevant inflections. 
	
	- Nouns: Add to the NounInflections object. 
	
	- Verbs: Add to the Verbs object. The Expectations object for verbs specify what this verb is "looking for" or "has a gap for", in the Michigan Latin approach, e.g. transitive verbs will expect an accusative direct object, while special intransitive verbs will expect a dative (for the purposes of novice learning, we included the subject for all verbs, though this is not required). 
	
	- Adjectives: Add to the Adjectives object. Include in it the adjective's inflection.
	
	- Prepositions: Add to the Prepositions object. Include in it the case that it takes.
	
	- Adverbs: Add to the Adverbs object.

##### Change the Words in the Sentences
Three pages of sentences can be found in [/app/latin/sentences](https://github.com/sharonzhou/ingenium/app/latin/sentences), which correspond to the three rendered pages of blocks at [TeachMeLatin](http://TeachMeLatin.com) (they are separated by a click of the Continue button at the bottom of each page). 

- These 3 pages are in the folders 0, 1, and 2. 
- In each of these folders, please find 5 html files that correspond to the 5 sentences on that page. 

Please modify these to include your desired word blocks.

##### Specifying Different Parts of Speech
- Nouns are specified using a declined form first, followed by their lemma, and concluding with the word `noun`, e.g. `agricolae-agricola-noun`.
- Verbs are specified with its inflected form, e.g. `fugiunt`. Optionally, you may include the word `clampless`, e.g. `fugiunt-clampless`. This is to specify the shape of the verb. In our research, we explored two designs: one with clamps and one without. We found the clampless form to be more effective and compelled students to think outside of the otherwise strict horizontal word order, though the difference in their efficacy was not significant. Use either as you please :)
- The remaining words take on their inflected form without further specification.


_Please contact me if you find it difficult to navigate._

## License
Apache 2.0 License

### Notice
This work was built on Google's Blockly (2013) and Closure (2015) Libraries, and maintains the integrity of the License (both Apache 2.0) that lies therein. Following this License, the modifications herein are documented in the file NOTICE.



