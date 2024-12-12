# Testing file!

print("Hello, World!")

# Global variable to track calls
counter = 0

def increment_counter():
    """
    Increments the global counter and returns its value.
    :return: The updated counter value
    """
    global counter
    counter += 1
    return counter

def reset_counter():
    """
    Resets the counter to zero.
    """
    global counter
    counter = 0

def main():
    """
    Main function demonstrating the use of the above functions.
    """
    print("Initial counter value:", counter)
    print("After incrementing:", increment_counter())
    print("After another increment:", increment_counter())
    reset_counter()
    print("After reset:", counter)

# Call the main function
if __name__ == "__main__":
    main()
