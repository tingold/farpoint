import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Realm from 'realm';
import uuid from 'react-native-uuid';
import Icon from 'react-native-vector-icons/Ionicons';
import LayerList from './LayerList';
import WFSList from './WFSList';
import FButton from './FButton';
import { getFeatureType } from './wfs';
import * as db from './db';
import { orange, gray, darkGray } from './styles';

export default class FarPoint extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'FarPoint',
    };
  };

  state = {
    loading: true,
    wfsInput: 'http://localhost:8080/geoserver/ows',
  };

  onChangeText = wfsInput => {
    this.setState({ wfsInput });
  };

  onPress = async () => {
    try {
      const { navigate } = this.props.navigation;
      navigate('WFSAuth', { wfsUrl: this.state.wfsInput });
    } catch (error) {
      console.log('wfs error', error);
    }
  };

  componentWillMount() {
    db.monitor();
    const wfs = db.realm.objects('WFS');
    db.realm.addListener('change', (realm, type) => {
      //this.forceUpdate();
    });
    this.setState({ loading: false, wfs });
  }

  render() {
    if (this.state.loading) {
      return <Text>Loading</Text>;
    }
    const empty = this.state.wfs.length === 0;
    return (
      <View style={styles.container}>
        <View style={[styles.top, empty && { flex: 1 }]}>
          {empty && (
            <View>
              <Text style={styles.welcome}>Welcome to FarPoint</Text>
              <Text style={styles.instructions}>
                To begin, enter the URL for your WFS enabled GIS Server:
              </Text>
            </View>
          )}
          {!empty && (
            <Text style={styles.instructions}>Add a URL for a WFS enabled GIS Server:</Text>
          )}
          <TextInput
            style={styles.input}
            multiline
            autoCapitalize={'none'}
            keyboardType={'url'}
            onChangeText={this.onChangeText}
            value={this.state.wfsInput}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Button onPress={this.onPress} title={empty ? 'Continue' : 'Add'} />
          </View>
        </View>
        {!empty && (
          <View style={styles.bottom}>
            <WFSList wfs={this.state.wfs} navigation={this.props.navigation} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  top: {
    backgroundColor: gray,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 16,
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: darkGray,
  },
  bottom: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 8,
    paddingBottom: 64,
  },
  instructions: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  headerBtn: {
    paddingRight: 16,
    color: 'white',
  },
});
