from project import project, migrate

def main():
    try:
        migrate()
        # project.run(debug=True)
        project.run(host='0.0.0.0', port=5000,debug=True)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()