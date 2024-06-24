import numpy as np
import nltk
nltk.download('punkt')
from nltk.stem.porter import PorterStemmer

stemmer = PorterStemmer()

def tokenize(sentence):
    """
    Tokenizes a sentence into words after cleaning it.
    Only alphabetic words are included.
    """
    # Clean the sentence by stripping whitespace
    sentence = sentence.strip()
    if not sentence:
        return []  # Return an empty list if the sentence is empty
    # Tokenize the sentence and filter to include only alphabetic words
    return [word for word in nltk.word_tokenize(sentence.lower()) if word.isalpha()]

def stem(word):
    """
    Stemming: find the root form of the word.
    Converts the word to lowercase before stemming.
    """
    return stemmer.stem(word.lower())

def bag_of_words(tokenized_sentence, words):
    """
    Return a bag of words array:
    1 for each known word that exists in the sentence, 0 otherwise.
    Example:
    sentence = ["hello", "how", "are", "you"]
    words = ["hi", "hello", "I", "you", "bye", "thank", "cool"]
    bag   = [  0 ,    1 ,    0 ,   1 ,    0 ,    0 ,      0]
    """
    # Stem each word in the tokenized sentence
    sentence_words = [stem(word) for word in tokenized_sentence]
    # Initialize the bag with 0 for each word
    bag = np.zeros(len(words), dtype=np.float32)
    for idx, w in enumerate(words):
        if w in sentence_words:
            bag[idx] = 1
    return bag
