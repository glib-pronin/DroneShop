from project import project

def main():
    try:
        # project.run(debug=True)
        project.run(host='0.0.0.0', port=5000,debug=True)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()