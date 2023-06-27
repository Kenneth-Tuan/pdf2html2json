import pdfkit

# Read the PDF file

pdf_file = open('./input/001.pdf', 'rb')

# Convert the PDF to HTML

html_file = pdfkit.from_file(pdf_file, 'my_html_file.html')

# Close the PDF file

pdf_file.close()