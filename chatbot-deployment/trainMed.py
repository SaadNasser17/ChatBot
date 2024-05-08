import json

def load_data(filepath):
    """ Load medication data from a JSON file and create a dictionary for quick lookup. """
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
        # Create a dictionary with medication names as keys and price information as values
        medication_dict = {item["Medication"]: item["Price Information"] for item in data}
        return medication_dict
    except FileNotFoundError:
        print(f"Error: The file {filepath} does not exist.")
        return None
    except json.JSONDecodeError:
        print("Error: The file is not a valid JSON.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def find_price(medication_name, medication_dict):
    """ Return the price information for a given medication name or a not found message. """
    return medication_dict.get(medication_name, "Medication not found.")

def main():
    filepath = 'datasets/csvjson.json'  # Update this path as necessary
    medication_dict = load_data(filepath)
    
    if medication_dict is None:
        print("Failed to load medication data.")
        return  # Exit if the data did not load correctly
    
    print("Medication data loaded successfully. Enter medication names to get price information.")
    # Prompt the user to enter a medication name and display the corresponding price information
    while True:
        medication_name = input("Enter the medication name (or type 'exit' to quit): ")
        if medication_name.lower() == 'exit':
            print("Exiting program.")
            break
        price_info = find_price(medication_name, medication_dict)
        print(f"Price Information for '{medication_name}': {price_info}")

if __name__ == '__main__':
    main()
