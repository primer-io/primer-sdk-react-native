import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'pink'
  },
  triple: {
    flex: 2,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    margin: 12,
    padding: 10,
    flex: 1,
  },
  picker: {
    width: '100%',
  },
  red: {
    backgroundColor: 'red',
  },
  blue: {
    backgroundColor: 'blue',
  },
  green: {
    backgroundColor: 'green',
  },
  yellow: {
    backgroundColor: 'yellow',
  },
  appBar: {
    height: 44,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  image: {
    width: 50,
    padding: 0,
    resizeMode: 'contain',
  },
  frame: {
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#111119',
    borderRadius: 16,
    height: 56,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    // alignContent: 'center',
    // textAlign: 'center',
  },
});
