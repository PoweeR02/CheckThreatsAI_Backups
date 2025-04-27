import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

# ---------------------------
# Callbacks
# ---------------------------
early_stop = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)
reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=2,
    min_lr=1e-6
)
checkpoint = tf.keras.callbacks.ModelCheckpoint(
    'best_model.keras',
    monitor='val_loss',
    save_best_only=True,
    verbose=1
)

# ---------------------------
# Load dataset
# ---------------------------
def load_data():
    df = pd.read_excel("Windows_Malware_Detection_Balanced_&_Cleaned.xlsx")
    X = df.iloc[:, 2:].values.astype(np.float32)
    y = df["Type"].values
    num_classes = 7
    y_encoded = tf.keras.utils.to_categorical(y, num_classes=num_classes)
    return X, y_encoded, num_classes

# ---------------------------
# Stratified split
# ---------------------------
def split_data(X, y, reshape_for_lstm=True):
    y_int = np.argmax(y, axis=1)
    # 70% train, 30% temporal
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y_int
    )
    y_temp_int = np.argmax(y_temp, axis=1)
    # Of that 30%, use 1/3 for testing (10% total) and 2/3 for validation (20% total)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=1/3, random_state=42, stratify=y_temp_int
    )
    return X_train, X_val, X_test, y_train, y_val, y_test


# ---------------------------
# Error percentage by class
# ---------------------------
def error_by_class(y_true, y_pred, label_set):
    errors = []
    for label in label_set:
        idx = np.where(y_true == label)[0]
        total = len(idx)
        correct = np.sum(y_true[idx] == y_pred[idx])
        error_pct = 100 - (correct / total * 100)
        errors.append(round(error_pct, 2))
    return errors

# ---------------------------
# LSTM Model + Training + Error by Class
# ---------------------------
def lstm_model():
    X, y, num_classes = load_data()
    n_timesteps = X.shape[1]
    X = X.reshape(X.shape[0], n_timesteps, 1)
    X_train, X_val, X_test, y_train, y_val, y_test = split_data(X, y)

    model = tf.keras.models.Sequential([
        tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64, return_sequences=True), input_shape=(n_timesteps, 1)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(32)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])

    optimizer = tf.keras.optimizers.Adam(learning_rate=0.006)
    model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])
    model.summary()

    history = model.fit(
        X_train, y_train,
        epochs=100,
        batch_size=64,
        validation_data=(X_val, y_val),
        callbacks=[early_stop, reduce_lr, checkpoint]
    )

    test_loss, test_acc = model.evaluate(X_test, y_test)
    print("✅ LSTM Test accuracy:", test_acc)

    # ---------------------------
    # Calculate errors by class
    # ---------------------------
    y_train_pred = model.predict(X_train)
    y_train_true = np.argmax(y_train, axis=1)
    y_train_pred_classes = np.argmax(y_train_pred, axis=1)

    y_test_pred = model.predict(X_test)
    y_test_true = np.argmax(y_test, axis=1)
    y_test_pred_classes = np.argmax(y_test_pred, axis=1)

    labels = np.unique(y_test_true)

    train_errors = error_by_class(y_train_true, y_train_pred_classes, labels)
    test_errors = error_by_class(y_test_true, y_test_pred_classes, labels)

    df_errors = pd.DataFrame({
        'Class': labels,
        'Train Error (%)': train_errors,
        'Test Error (%)': test_errors
    })

    print("\n📊 Error percentage by class:")
    print(df_errors.to_string(index=False))

    # ---------------------------
    # Confusion matrix (as table)
    # ---------------------------

    cm = confusion_matrix(y_test_true, y_test_pred_classes)
    cm_df = pd.DataFrame(
        cm,
        index=[f"Real {i}" for i in labels],
        columns=[f"Pred {i}" for i in labels]
    )

    print("\n📊 Confusion matrix (test set):\n")
    print(cm_df)

# ---------------------------
# Execute
# ---------------------------
if __name__ == '__main__':
    lstm_model()
