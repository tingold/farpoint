import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import scformschema from 'spatialconnect-form-schema/native';
import { find } from 'lodash';
import * as db from './db';
import { gray, darkGray } from './styles';

let self;
class Form extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: JSON.parse(navigation.state.params.layer.metadata).Title,
    headerRight: (
      <TouchableOpacity onPress={() => self.scform.onSubmit()}>
        <Text style={styles.submitBtnStyle}>Submit</Text>
      </TouchableOpacity>
    ),
  });
  constructor(props) {
    super(props);
    self = this;
    this.state = {
      submitting: false,
      layer: null,
    };
    this.saveForm = this.saveForm.bind(this);
  }
  saveForm(formData) {
    this.setState({ submitting: true });
    const { layer, feature, operation } = this.props.navigation.state.params;
    const gj = {
      id: feature.id,
      geometry: feature.geometry,
      properties: formData,
    };
    db.save(layer, gj, operation);
    this.scform.formSubmitted();
    this.setState({ submitting: false });
  }
  componentWillMount() {
    const { layer, feature } = this.props.navigation.state.params;
    const metadata = JSON.parse(layer.metadata);
    const schema = metadata.schema;
    if (feature) {
      if (feature.properties) {
        Object.keys(feature.properties).forEach(field_key => {
          const field = find(schema.fields, { field_key });
          if (field) {
            field.constraints.initial_value = feature.properties[field_key];
          }
        });
      }
    }
    this.setState({ schema });
  }
  render() {
    const { layer, feature } = this.props.navigation.state.params;
    const { SCForm } = scformschema;
    const { submitting } = this.state;
    return (
      <View style={styles.container}>
        {feature &&
        feature.geometry && (
          <View style={styles.location}>
            <Text>
              Location: {feature.geometry.coordinates[1]}, {feature.geometry.coordinates[0]}
            </Text>
          </View>
        )}
        <SCForm
          ref={scform => {
            this.scform = scform;
          }}
          form={this.state.schema}
          submitting={submitting}
          saveForm={this.saveForm}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  submitBtnStyle: {
    paddingRight: 16,
    color: 'white',
  },
  location: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: darkGray,
    backgroundColor: gray,
  },
});

export default Form;
