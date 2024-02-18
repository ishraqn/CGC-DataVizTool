import csv

def clean_oats_data(file_path):
    cleaned_data = []
    with open(file_path, 'r') as csv_file:
        csv_reader = csv.reader(csv_file)
        header = next(csv_reader, None)  # Read the header row
        if header is None:
            print("Error: Missing header row in the CSV file.")
            return
        # Check if all required columns exist
        if len(header) < 5:
            print("Error: Missing one or more required columns in the CSV file.")
            return
        
    # Check the index of required columns
    lat_idx = header.index('Lat')
    long_idx = header.index('Long')
    
    for row in csv_reader:
        try:
            # Attempt to convert latitude and longitude to float
            lat  = float(row[lat_idx])
            long = float(row[long_idx])
            # Check latitude and longitude values
            if -180 <= long <= 180 and -90 <= lat <= 90:
                cleaned_data.append(row)
            else:
                print(f"Invalid latitude or longitude values in row: {row}")
        except ValueError:
            # Skip rows where latitude or longitude cannot be converted to float
            print(f"Skipping row due to invalid latitude or longitude values: {row}")
            continue


    # Save the cleaned data to a new CSV file
    cleaned_file_path = 'cleaned_oats.csv'
    with open(cleaned_file_path, 'w', newline='') as cleaned_file:
        csv_writer = csv.writer(cleaned_file)
        csv_writer.writerow(['Sample', 'Station', 'Provice', 'Latitude', 'Longitude'])  # Assuming these are the column names
        csv_writer.writerows(cleaned_data)
    
    print(f"Cleaned data saved to {cleaned_file_path}")

    # Replace 'oats.csv' with the path to your actual file
    clean_oats_data('oats.csv')
